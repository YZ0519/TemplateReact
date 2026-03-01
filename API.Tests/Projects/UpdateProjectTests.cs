using Xunit;
using API.Tests.Infrastructure;
using Domain;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace API.Tests.Projects;

public class UpdateProjectTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UpdateProjectTests(CustomWebApplicationFactory factory)
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
            Title = $"Update Test Project {slugSuffix}",
            Slug = $"update-test-project-{slugSuffix}",
            Description = "Original description for update test",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return project;
    }

    [Fact]
    public async Task UpdateProject_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = _factory.CreateClient();
        var payload = new { title = "Updated Title", description = "Updated description text here" };

        // Act
        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateProject_Returns200_WhenAuthenticatedAndValidData()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        var payload = new
        {
            title = "Updated Project Title",
            description = "Updated description that is sufficiently long"
        };

        // Act
        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdateProject_Returns404_ForNonExistentId()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var nonExistentId = Guid.NewGuid().ToString();

        var payload = new
        {
            title = "Title For NonExistent Project",
            description = "Description that is sufficiently long for validation"
        };

        // Act
        var response = await client.PutAsJsonAsync($"/api/projects/{nonExistentId}", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateProject_SlugDoesNotChange_WhenTitleIsUpdated()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var originalSlug = project.Slug;
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        var payload = new
        {
            title = "A Completely Different Title Now",
            description = "Updated description that is sufficiently long"
        };

        // Act
        await client.PutAsJsonAsync($"/api/projects/{project.Id}", payload);

        // Verify slug did not change by fetching the detail
        var detailResponse = await client.GetAsync($"/api/projects/{originalSlug}");

        // Assert - original slug still works
        detailResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
