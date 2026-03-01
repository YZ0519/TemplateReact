using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class UpdateProject
{
    public class Command : IRequest<Result<Unit>>
    {
        public string Id { get; set; } = string.Empty;
        public required string Title { get; set; }
        public required string Description { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var project = await context.Projects
                .SingleOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (project is null) return Result<Unit>.Failure("Project not found", 404);

            project.Title = request.Title;
            project.Description = request.Description;
            project.DisplayOrder = request.DisplayOrder;
            project.UpdatedAt = DateTime.UtcNow;

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to update project", 400);
        }
    }
}
