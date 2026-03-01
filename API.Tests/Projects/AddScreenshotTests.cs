using Xunit;
using API.Tests.Infrastructure;
using Application.Profiles.DTOs;
using Application.Projects.DTOs;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Persistence;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace API.Tests.Projects;

public class AddScreenshotTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AddScreenshotTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<Project> SeedProjectAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var project = new Project
        {
            Id = Guid.NewGuid().ToString(),
            Title = $"Screenshot Add Project {slugSuffix}",
            Slug = $"screenshot-add-project-{slugSuffix}",
            Description = "Project for screenshot upload tests",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return project;
    }

    private static MultipartFormDataContent CreateScreenshotFormData(string? caption = null, int displayOrder = 0)
    {
        var fileBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }; // Minimal JPEG header bytes
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");

        var form = new MultipartFormDataContent();
        form.Add(fileContent, "file", "test-screenshot.jpg");
        form.Add(new StringContent(displayOrder.ToString()), "displayOrder");

        if (caption != null)
        {
            form.Add(new StringContent(caption), "caption");
        }

        return form;
    }

    [Fact]
    public async Task AddScreenshot_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = _factory.CreateClient();

        using var form = CreateScreenshotFormData();

        // Act
        var response = await client.PostAsync($"/api/projects/{project.Id}/screenshots", form);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AddScreenshot_Returns200WithScreenshotDto_WhenAuthenticatedAndValid()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        _factory.PhotoServiceMock
            .Setup(x => x.UploadPhoto(It.IsAny<IFormFile>()))
            .ReturnsAsync(new PhotoUploadResult
            {
                PublicId = "test-id",
                Url = "https://res.cloudinary.com/test.jpg"
            });

        using var form = CreateScreenshotFormData(caption: "Test caption", displayOrder: 0);

        // Act
        var response = await client.PostAsync($"/api/projects/{project.Id}/screenshots", form);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await response.Content.ReadFromJsonAsync<ProjectScreenshotDto>();
        dto.Should().NotBeNull();
        dto!.Url.Should().Be("https://res.cloudinary.com/test.jpg");
        dto.PublicId.Should().Be("test-id");
        dto.Id.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task AddScreenshot_Returns404_ForUnknownProjectId()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var nonExistentId = Guid.NewGuid().ToString();

        _factory.PhotoServiceMock
            .Setup(x => x.UploadPhoto(It.IsAny<IFormFile>()))
            .ReturnsAsync(new PhotoUploadResult
            {
                PublicId = "test-id",
                Url = "https://res.cloudinary.com/test.jpg"
            });

        using var form = CreateScreenshotFormData();

        // Act
        var response = await client.PostAsync($"/api/projects/{nonExistentId}/screenshots", form);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
