namespace Application.Projects.DTOs;

public class ProjectScreenshotDto
{
    public required string Id { get; set; }
    public required string Url { get; set; }
    public required string PublicId { get; set; }
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; }
}
