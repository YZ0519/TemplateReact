namespace Domain;

public class ProjectTechStack
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string ProjectId { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public int DisplayOrder { get; set; } = 0;

    public Project Project { get; set; } = null!;
}
