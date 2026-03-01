using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<User>(options)
{
    public required DbSet<Photo> Photos { get; set; }
    public required DbSet<UserFollowing> UserFollowings { get; set; }
    public required DbSet<Project> Projects { get; set; }
    public required DbSet<ProjectFeature> ProjectFeatures { get; set; }
    public required DbSet<ProjectTechStack> ProjectTechStacks { get; set; }
    public required DbSet<ProjectScreenshot> ProjectScreenshots { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<UserFollowing>(x =>
        {
            x.HasKey(k => new { k.ObserverId, k.TargetId });

            x.HasOne(x => x.Observer)
            .WithMany(x => x.Followings)
            .HasForeignKey(x => x.ObserverId)
            .OnDelete(DeleteBehavior.Cascade);

            x.HasOne(x => x.Target)
            .WithMany(x => x.Followers)
            .HasForeignKey(x => x.TargetId)
            .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Project>(x =>
        {
            x.HasIndex(p => p.Slug).IsUnique();

            x.HasMany(p => p.Features)
             .WithOne(f => f.Project)
             .HasForeignKey(f => f.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);

            x.HasMany(p => p.TechStacks)
             .WithOne(t => t.Project)
             .HasForeignKey(t => t.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);

            x.HasMany(p => p.Screenshots)
             .WithOne(s => s.Project)
             .HasForeignKey(s => s.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
            }
        }
    }
}
