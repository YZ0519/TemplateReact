using Xunit;
using API.Tests.Infrastructure;
using Domain;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net;
using FluentAssertions;

namespace API.Tests.Projects;

public class RemoveTechStackTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RemoveTechStackTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<(Project project, ProjectTechStack techStack)> SeedProjectWithTechStackAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var projectId = Guid.NewGuid().ToString();
        var techStackId = Guid.NewGuid().ToString();

        var techStack = new ProjectTechStack
        {
            Id = techStackId,
            ProjectId = projectId,
            Name = "Vue.js",
            Category = "Frontend",
            DisplayOrder = 0
        };

        var project = new Project
        {
            Id = projectId,
            Title = $"TechStack Remove Project {slugSuffix}",
            Slug = $"techstack-remove-project-{slugSuffix}",
            Description = "Project for removing tech stack items",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            TechStacks = [techStack]
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return (project, techStack);
    }

    [Fact]
    public async Task RemoveTechStack_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var (project, techStack) = await SeedProjectWithTechStackAsync();
        var client = _factory.CreateClient();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/tech-stack/{techStack.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RemoveTechStack_Returns200_WhenAuthenticatedAndValid()
    {
        // Arrange
        var (project, techStack) = await SeedProjectWithTechStackAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/tech-stack/{techStack.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RemoveTechStack_Returns404_ForUnknownItemId()
    {
        // Arrange
        var (project, _) = await SeedProjectWithTechStackAsync();
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var nonExistentItemId = Guid.NewGuid().ToString();

        // Act
        var response = await client.DeleteAsync($"/api/projects/{project.Id}/tech-stack/{nonExistentItemId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
