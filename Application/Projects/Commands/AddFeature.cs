using Application.Core;
using Application.Projects.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class AddFeature
{
    public class Command : IRequest<Result<ProjectFeatureDto>>
    {
        public string ProjectId { get; set; } = string.Empty;
        public required string Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<ProjectFeatureDto>>
    {
        public async Task<Result<ProjectFeatureDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var project = await context.Projects
                .SingleOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (project is null) return Result<ProjectFeatureDto>.Failure("Project not found", 404);

            var feature = new ProjectFeature
            {
                ProjectId = request.ProjectId,
                Description = request.Description,
                DisplayOrder = request.DisplayOrder
            };

            context.ProjectFeatures.Add(feature);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<ProjectFeatureDto>.Success(mapper.Map<ProjectFeatureDto>(feature))
                : Result<ProjectFeatureDto>.Failure("Failed to add feature", 400);
        }
    }
}
