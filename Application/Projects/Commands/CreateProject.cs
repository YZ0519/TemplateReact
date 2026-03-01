using Application.Core;
using Application.Projects.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Text.RegularExpressions;

namespace Application.Projects.Commands;

public class CreateProject
{
    public class Command : IRequest<Result<ProjectDetailDto>>
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<ProjectDetailDto>>
    {
        public async Task<Result<ProjectDetailDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var slug = GenerateSlug(request.Title);

            var existingSlugs = await context.Projects
                .Where(p => p.Slug.StartsWith(slug))
                .Select(p => p.Slug)
                .ToListAsync(cancellationToken);

            if (existingSlugs.Contains(slug))
            {
                int suffix = 2;
                while (existingSlugs.Contains($"{slug}-{suffix}")) suffix++;
                slug = $"{slug}-{suffix}";
            }

            var project = new Project
            {
                Title = request.Title,
                Slug = slug,
                Description = request.Description,
                DisplayOrder = request.DisplayOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Projects.Add(project);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<ProjectDetailDto>.Failure("Failed to create project", 400);

            return Result<ProjectDetailDto>.Success(mapper.Map<ProjectDetailDto>(project));
        }

        private static string GenerateSlug(string title)
        {
            var slug = title.ToLowerInvariant();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-");
            slug = slug.Trim('-');
            return slug;
        }
    }
}
