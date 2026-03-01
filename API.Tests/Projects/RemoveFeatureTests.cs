using Xunit;
using API.Tests.Infrastructure;
using Domain;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net;
using FluentAssertions;

namespace API.Tests.Projects;

public class RemoveFeatureTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RemoveFeatureTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<(Project project, ProjectFeature feature)> SeedProjectWithFeatureAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var projectId = Guid.NewGuid().ToString();
        var featureId = Guid.NewGuid().ToString();

        var feature = new ProjectFeature
        {
            Id = featureId,
            ProjectId = projectId,
            Description = "A feature to remove during test",
            DisplayOrder = 0
        };

        var project = new Project
        {
            Id = projectId,
            Title = $"Feature Remove Project {slugSuffix}",
            Slug = $"feature-remove-project-{slugSuffix}",
            Description = "Project for removing features in tests",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Features = [feature]
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return (project, feature);
    }

    [Fact]
    public async Task RemoveFeature_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var (project, feature) = await SeedProjectWithFeatureAsync();
        var client = _factory.CreateClient();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/features/{feature.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RemoveFeature_Returns200_WhenAuthenticatedAndValid()
    {
        // Arrange
        var (project, feature) = await SeedProjectWithFeatureAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/features/{feature.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RemoveFeature_Returns404_ForUnknownFeatureId()
    {
        // Arrange
        var (project, _) = await SeedProjectWithFeatureAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var nonExistentFeatureId = Guid.NewGuid().ToString();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/features/{nonExistentFeatureId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
