using Application.Core;
using Application.Projects.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Queries;

public class GetProjects
{
    public class Query : IRequest<Result<List<ProjectSummaryDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<List<ProjectSummaryDto>>>
    {
        public async Task<Result<List<ProjectSummaryDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var projects = await context.Projects
                .OrderBy(p => p.DisplayOrder)
                .ProjectTo<ProjectSummaryDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<ProjectSummaryDto>>.Success(projects);
        }
    }
}
