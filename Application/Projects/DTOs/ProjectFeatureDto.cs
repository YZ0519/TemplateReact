namespace Application.Projects.DTOs;

public class ProjectFeatureDto
{
    public required string Id { get; set; }
    public required string Description { get; set; }
    public int DisplayOrder { get; set; }
}
