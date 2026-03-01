using Xunit;
using API.Tests.Infrastructure;
using Application.Projects.DTOs;
using Domain;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace API.Tests.Projects;

public class GetProjectsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public GetProjectsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetProjects_Returns200WithList_WhenUnauthenticated()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var projects = await response.Content.ReadFromJsonAsync<List<ProjectSummaryDto>>();
        projects.Should().NotBeNull();
    }

    [Fact]
    public async Task GetProjects_ReturnsProjectsOrderedByDisplayOrderAscending()
    {
        // Arrange
        var client = _factory.CreateClient();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var project1 = new Project
        {
            Id = Guid.NewGuid().ToString(),
            Title = $"Project Order A {slugSuffix}",
            Slug = $"project-order-a-{slugSuffix}",
            Description = "First project with higher display order",
            DisplayOrder = 10,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var project2 = new Project
        {
            Id = Guid.NewGuid().ToString(),
            Title = $"Project Order B {slugSuffix}",
            Slug = $"project-order-b-{slugSuffix}",
            Description = "Second project with lower display order",
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.AddRange(project1, project2);
        await context.SaveChangesAsync();

        // Act
        var response = await client.GetAsync("/api/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var projects = await response.Content.ReadFromJsonAsync<List<ProjectSummaryDto>>();
        projects.Should().NotBeNull();

        // Find our two projects in the result and verify ordering
        var relevantProjects = projects!
            .Where(p => p.Slug == project1.Slug || p.Slug == project2.Slug)
            .ToList();

        relevantProjects.Should().HaveCount(2);

        var firstIndex = projects!.FindIndex(p => p.Slug == project2.Slug);
        var secondIndex = projects!.FindIndex(p => p.Slug == project1.Slug);
        firstIndex.Should().BeLessThan(secondIndex, "lower DisplayOrder should come first");
    }

    [Fact]
    public async Task GetProjects_EachProjectIncludesTechStacksCollection()
    {
        // Arrange
        var client = _factory.CreateClient();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var projectId = Guid.NewGuid().ToString();
        var project = new Project
        {
            Id = projectId,
            Title = $"TechStack Project {slugSuffix}",
            Slug = $"techstack-project-{slugSuffix}",
            Description = "A project with tech stacks for testing",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            TechStacks =
            [
                new ProjectTechStack
                {
                    Id = Guid.NewGuid().ToString(),
                    ProjectId = projectId,
                    Name = "C#",
                    Category = "Backend",
                    DisplayOrder = 0
                }
            ]
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        // Act
        var response = await client.GetAsync("/api/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var projects = await response.Content.ReadFromJsonAsync<List<ProjectSummaryDto>>();
        projects.Should().NotBeNull();

        var found = projects!.FirstOrDefault(p => p.Slug == project.Slug);
        found.Should().NotBeNull();
        found!.TechStacks.Should().NotBeNull();
        found.TechStacks.Should().HaveCount(1);
        found.TechStacks.First().Name.Should().Be("C#");
    }
}
