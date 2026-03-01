namespace Domain;

public class ProjectFeature
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string ProjectId { get; set; }
    public required string Description { get; set; }
    public int DisplayOrder { get; set; } = 0;

    public Project Project { get; set; } = null!;
}
