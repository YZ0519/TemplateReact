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

public class AddTechStackTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AddTechStackTests(CustomWebApplicationFactory factory)
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
            Title = $"TechStack Add Project {slugSuffix}",
            Slug = $"techstack-add-project-{slugSuffix}",
            Description = "Project for adding tech stack items",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return project;
    }

    [Fact]
    public async Task AddTechStack_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = _factory.CreateClient();
        var payload = new { name = "React", category = "Frontend" };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tech-stack", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AddTechStack_Returns200WithTechStackDto_WhenAuthenticatedAndValid()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var payload = new { name = "TypeScript", category = "Frontend", displayOrder = 0 };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tech-stack", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await response.Content.ReadFromJsonAsync<ProjectTechStackDto>();
        dto.Should().NotBeNull();
        dto!.Name.Should().Be("TypeScript");
        dto.Category.Should().Be("Frontend");
        dto.Id.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task AddTechStack_Returns404_ForUnknownProjectId()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var nonExistentId = Guid.NewGuid().ToString();
        var payload = new { name = "React", category = "Frontend" };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{nonExistentId}/tech-stack", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AddTechStack_Returns400_WhenNameIsEmpty()
    {
        // Arrange
        var project = await SeedProjectAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var payload = new { name = "", category = "Frontend" };

        // Act
        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tech-stack", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Errors.Should().ContainKey("Name");
    }
}
