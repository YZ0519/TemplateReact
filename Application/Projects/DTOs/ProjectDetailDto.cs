namespace Application.Projects.DTOs;

public class ProjectDetailDto
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProjectTechStackDto> TechStacks { get; set; } = [];
    public List<ProjectFeatureDto> Features { get; set; } = [];
    public List<ProjectScreenshotDto> Screenshots { get; set; } = [];
}
