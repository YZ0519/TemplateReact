namespace Application.Projects.DTOs;

public class ProjectTechStackDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public int DisplayOrder { get; set; }
}
