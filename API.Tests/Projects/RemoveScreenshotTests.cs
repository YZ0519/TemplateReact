using Xunit;
using API.Tests.Infrastructure;
using Domain;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Persistence;
using System.Net;
using FluentAssertions;

namespace API.Tests.Projects;

public class RemoveScreenshotTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RemoveScreenshotTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<(Project project, ProjectScreenshot screenshot)> SeedProjectWithScreenshotAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var projectId = Guid.NewGuid().ToString();
        var screenshotId = Guid.NewGuid().ToString();
        var publicId = $"test/screenshot-{slugSuffix}";

        var screenshot = new ProjectScreenshot
        {
            Id = screenshotId,
            ProjectId = projectId,
            Url = $"https://res.cloudinary.com/{publicId}.jpg",
            PublicId = publicId,
            Caption = "Test screenshot",
            DisplayOrder = 0
        };

        var project = new Project
        {
            Id = projectId,
            Title = $"Screenshot Remove Project {slugSuffix}",
            Slug = $"screenshot-remove-project-{slugSuffix}",
            Description = "Project for screenshot removal tests",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Screenshots = [screenshot]
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return (project, screenshot);
    }

    [Fact]
    public async Task RemoveScreenshot_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var (project, screenshot) = await SeedProjectWithScreenshotAsync();
        var client = _factory.CreateClient();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/screenshots/{screenshot.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RemoveScreenshot_Returns200_WhenAuthenticatedAndValid()
    {
        // Arrange
        var (project, screenshot) = await SeedProjectWithScreenshotAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        _factory.PhotoServiceMock
            .Setup(x => x.DeletePhoto(It.IsAny<string>()))
            .ReturnsAsync("ok");

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/screenshots/{screenshot.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RemoveScreenshot_VerifiesDeletePhotoCalledWithCorrectPublicId()
    {
        // Arrange
        var (project, screenshot) = await SeedProjectWithScreenshotAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var expectedPublicId = screenshot.PublicId;

        _factory.PhotoServiceMock.Reset();
        _factory.PhotoServiceMock
            .Setup(x => x.DeletePhoto(It.IsAny<string>()))
            .ReturnsAsync("ok");

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/screenshots/{screenshot.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        _factory.PhotoServiceMock.Verify(x => x.DeletePhoto(expectedPublicId), Times.Once);
    }
}
