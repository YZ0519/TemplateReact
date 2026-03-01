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

public class GetProjectBySlugTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public GetProjectBySlugTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<Project> SeedProjectWithChildrenAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var slugSuffix = Guid.NewGuid().ToString("N")[..8];
        var projectId = Guid.NewGuid().ToString();

        var project = new Project
        {
            Id = projectId,
            Title = $"Slug Detail Project {slugSuffix}",
            Slug = $"slug-detail-project-{slugSuffix}",
            Description = "A project with all child collections populated",
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            TechStacks =
            [
                new ProjectTechStack
                {
                    Id = Guid.NewGuid().ToString(),
                    ProjectId = projectId,
                    Name = "React",
                    Category = "Frontend",
                    DisplayOrder = 0
                }
            ],
            Features =
            [
                new ProjectFeature
                {
                    Id = Guid.NewGuid().ToString(),
                    ProjectId = projectId,
                    Description = "Feature one description",
                    DisplayOrder = 0
                }
            ],
            Screenshots =
            [
                new ProjectScreenshot
                {
                    Id = Guid.NewGuid().ToString(),
                    ProjectId = projectId,
                    Url = "https://res.cloudinary.com/test/hero.jpg",
                    PublicId = "test/hero",
                    Caption = "Hero shot",
                    DisplayOrder = 0
                }
            ]
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return project;
    }

    [Fact]
    public async Task GetProjectBySlug_Returns200_WhenUnauthenticatedAndSlugIsValid()
    {
        // Arrange
        var project = await SeedProjectWithChildrenAsync();
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync($"/api/projects/{project.Slug}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetProjectBySlug_Returns404_WhenSlugIsUnknown()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/projects/totally-nonexistent-slug-xyz-999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetProjectBySlug_ResponseIncludesTechStacksFeaturesScreenshots()
    {
        // Arrange
        var project = await SeedProjectWithChildrenAsync();
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync($"/api/projects/{project.Slug}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await response.Content.ReadFromJsonAsync<ProjectDetailDto>();
        dto.Should().NotBeNull();
        dto!.Slug.Should().Be(project.Slug);
        dto.TechStacks.Should().NotBeNull().And.HaveCount(1);
        dto.Features.Should().NotBeNull().And.HaveCount(1);
        dto.Screenshots.Should().NotBeNull().And.HaveCount(1);
    }
}
