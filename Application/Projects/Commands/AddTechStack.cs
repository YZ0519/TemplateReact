using Application.Core;
using Application.Projects.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class AddTechStack
{
    public class Command : IRequest<Result<ProjectTechStackDto>>
    {
        public string ProjectId { get; set; } = string.Empty;
        public required string Name { get; set; }
        public required string Category { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<ProjectTechStackDto>>
    {
        public async Task<Result<ProjectTechStackDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var project = await context.Projects
                .SingleOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (project is null) return Result<ProjectTechStackDto>.Failure("Project not found", 404);

            var techStack = new ProjectTechStack
            {
                ProjectId = request.ProjectId,
                Name = request.Name,
                Category = request.Category,
                DisplayOrder = request.DisplayOrder
            };

            context.ProjectTechStacks.Add(techStack);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<ProjectTechStackDto>.Success(mapper.Map<ProjectTechStackDto>(techStack))
                : Result<ProjectTechStackDto>.Failure("Failed to add tech stack item", 400);
        }
    }
}
