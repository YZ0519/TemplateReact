using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class RemoveTechStack
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ProjectId { get; set; }
        public required string ItemId { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var techStack = await context.ProjectTechStacks
                .SingleOrDefaultAsync(t => t.Id == request.ItemId && t.ProjectId == request.ProjectId, cancellationToken);

            if (techStack is null) return Result<Unit>.Failure("Tech stack item not found", 404);

            context.ProjectTechStacks.Remove(techStack);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to remove tech stack item", 400);
        }
    }
}
