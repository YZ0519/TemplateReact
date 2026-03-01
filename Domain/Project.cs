namespace Domain;

public class Project
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectFeature> Features { get; set; } = [];
    public ICollection<ProjectTechStack> TechStacks { get; set; } = [];
    public ICollection<ProjectScreenshot> Screenshots { get; set; } = [];
}
