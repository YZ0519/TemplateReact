using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class DeleteProject
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IPhotoService photoService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var project = await context.Projects
                .Include(p => p.Screenshots)
                .SingleOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (project is null) return Result<Unit>.Failure("Project not found", 404);

            foreach (var screenshot in project.Screenshots)
            {
                await photoService.DeletePhoto(screenshot.PublicId);
            }

            context.Projects.Remove(project);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to delete project", 400);
        }
    }
}
