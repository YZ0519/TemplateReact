using Xunit;
using API.Tests.Infrastructure;
using Application.Projects.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace API.Tests.Projects;

public class CreateProjectTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CreateProjectTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateProject_Returns401_WhenUnauthenticated()
    {
        // Arrange
        var client = _factory.CreateClient();
        var payload = new { title = "My Unauthenticated Project", description = "Valid description here" };

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateProject_Returns200WithProjectDetailDto_WhenAuthenticatedAndValid()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var uniqueTitle = $"My Test Project {Guid.NewGuid():N}";
        var payload = new
        {
            title = uniqueTitle,
            description = "A valid description with more than ten characters"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await response.Content.ReadFromJsonAsync<ProjectDetailDto>();
        dto.Should().NotBeNull();
        dto!.Title.Should().Be(uniqueTitle);
        dto.Id.Should().NotBeNullOrWhiteSpace();
        dto.Slug.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task CreateProject_SlugIsGeneratedFromTitle()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var title = $"My Test Project Abc {uniqueSuffix}";
        var expectedSlugBase = $"my-test-project-abc-{uniqueSuffix}";

        var payload = new
        {
            title,
            description = "A valid description that is long enough"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await response.Content.ReadFromJsonAsync<ProjectDetailDto>();
        dto.Should().NotBeNull();
        dto!.Slug.Should().Be(expectedSlugBase);
    }

    [Fact]
    public async Task CreateProject_Returns400WithTitleError_WhenTitleIsEmpty()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var payload = new
        {
            title = "",
            description = "A valid description that is long enough"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Errors.Should().ContainKey("Title");
    }

    [Fact]
    public async Task CreateProject_Returns400WithTitleError_WhenTitleIs2Chars()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var payload = new
        {
            title = "AB",
            description = "A valid description that is long enough"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Errors.Should().ContainKey("Title");
    }

    [Fact]
    public async Task CreateProject_Returns400WithDescriptionError_WhenDescriptionIs5Chars()
    {
        // Arrange
        var client = await TestHelpers.CreateAuthenticatedClientAsync(_factory);
        var uniqueTitle = $"Valid Title {Guid.NewGuid():N}";
        var payload = new
        {
            title = uniqueTitle,
            description = "Short"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Errors.Should().ContainKey("Description");
    }
}
