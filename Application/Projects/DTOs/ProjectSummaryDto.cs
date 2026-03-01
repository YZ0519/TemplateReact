namespace Application.Projects.DTOs;

public class ProjectSummaryDto
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public int DisplayOrder { get; set; }
    public List<ProjectTechStackDto> TechStacks { get; set; } = [];
    public string? HeroScreenshotUrl { get; set; }
}
