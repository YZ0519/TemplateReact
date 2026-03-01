namespace Domain;

public class ProjectScreenshot
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string ProjectId { get; set; }
    public required string Url { get; set; }
    public required string PublicId { get; set; }
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; } = 0;

    public Project Project { get; set; } = null!;
}
