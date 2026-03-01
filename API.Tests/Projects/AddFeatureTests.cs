using Xunit;
using API.Tests.Infrastructure;
using Application.Projects.DTOs;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace API.Tests.Projects;

public class AddFeatureTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AddFeatureTests(CustomWebApplicationFactory factory)
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
            Title = $"Feature Add Project {slugSuffix}",
            Slug = $"feature-add-project-{slugSuffix}",
            Description = "Project for adding features to test",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return project;
    }

    [Fact]
    public async Task AddFeature_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = _factory.CreateClient();
        var payload = new { description = "A valid feature description" };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/features", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AddFeature_Returns200WithFeatureDto_WhenAuthenticatedAndValid()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var payload = new { description = "Real-time data synchronization across all users", displayOrder = 0 };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/features", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await response.Content.ReadFromJsonAsync<ProjectFeatureDto>();
        dto.Should().NotBeNull();
        dto!.Description.Should().Be("Real-time data synchronization across all users");
        dto.Id.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task AddFeature_Returns400_WhenDescriptionIsEmpty()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var payload = new { description = "" };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/features", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Errors.Should().ContainKey("Description");
    }
}
