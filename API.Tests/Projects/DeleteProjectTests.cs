using Xunit;
using API.Tests.Infrastructure;
using Domain;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Persistence;
using System.Net;
using FluentAssertions;

namespace API.Tests.Projects;

public class DeleteProjectTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DeleteProjectTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<Project> SeedProjectAsync(int screenshotCount = 0)
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var projectId = Guid.NewGuid().ToString();

        var screenshots = Enumerable.Range(0, screenshotCount).Select(i => new ProjectScreenshot
        {
            Id = Guid.NewGuid().ToString(),
            ProjectId = projectId,
            Url = $"https://res.cloudinary.com/test/screenshot-{i}.jpg",
            PublicId = $"test/screenshot-{slugSuffix}-{i}",
            DisplayOrder = i
        }).ToList();

        var project = new Project
        {
            Id = projectId,
            Title = $"Delete Test Project {slugSuffix}",
            Slug = $"delete-test-project-{slugSuffix}",
            Description = "Project for delete testing purposes",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Screenshots = screenshots
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return project;
    }

    [Fact]
    public async Task DeleteProject_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = _factory.CreateClient();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteProject_Returns200_WhenAuthenticatedAndValidId()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        _factory.PhotoServiceMock
            .Setup(x => x.DeletePhoto(It.IsAny<string>()))
            .ReturnsAsync("ok");

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task DeleteProject_Returns404_ForNonExistentId()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var nonExistentId = Guid.NewGuid().ToString();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteProject_CallsDeletePhotoOncePerScreenshot_WhenProjectHas2Screenshots()
    {
        // Arrange
        var project = await SeedProjectAsync(screenshotCount: 2);
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        _factory.PhotoServiceMock.Reset();
        _factory.PhotoServiceMock
            .Setup(x => x.DeletePhoto(It.IsAny<string>()))
            .ReturnsAsync("ok");

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        _factory.PhotoServiceMock.Verify(x => x.DeletePhoto(It.IsAny<string>()), Times.Exactly(2));
    }

    [Fact]
    public async Task DeleteProject_GetAfterDeleteReturns404()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        _factory.PhotoServiceMock
            .Setup(x => x.DeletePhoto(It.IsAny<string>()))
            .ReturnsAsync("ok");

        // Act
        var deleteResponse = await client.DeleteAsync($"/api/projects/{project.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await client.GetAsync($"/api/projects/{project.Slug}");

        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
