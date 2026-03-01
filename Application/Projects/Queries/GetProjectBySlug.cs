using Application.Core;
using Application.Projects.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Queries;

public class GetProjectBySlug
{
    public class Query : IRequest<Result<ProjectDetailDto>>
    {
        public required string Slug { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<ProjectDetailDto>>
    {
        public async Task<Result<ProjectDetailDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var project = await context.Projects
                .ProjectTo<ProjectDetailDto>(mapper.ConfigurationProvider)
                .SingleOrDefaultAsync(p => p.Slug == request.Slug, cancellationToken);

            return project is null
                ? Result<ProjectDetailDto>.Failure("Project not found", 404)
                : Result<ProjectDetailDto>.Success(project);
        }
    }
}
