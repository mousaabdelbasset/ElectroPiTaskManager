using ElectroPi.TaskManager.Application.Exceptions;
using ElectroPi.TaskManager.Application.Interfaces.Repositories;
using ElectroPi.TaskManager.Domain.Entities;
using ElectroPi.TaskManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectroPi.TaskManager.Infrastructure.Repositories;

public sealed class ProjectRepository : IProjectRepository
{
    private readonly TaskManagerDbContext _dbContext;

    public ProjectRepository(TaskManagerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Project>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Projects
            .AsNoTracking()
            .OrderBy(project => project.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<Project?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return _dbContext.Projects
            .AsNoTracking()
            .SingleOrDefaultAsync(project => project.Id == id, cancellationToken);
    }

    public Task<Project?> GetByIdWithTasksAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return _dbContext.Projects
            .AsNoTracking()
            .Include(project => project.Tasks.OrderBy(task => task.Id))
            .SingleOrDefaultAsync(project => project.Id == id, cancellationToken);
    }

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken)
    {
        return _dbContext.Projects
            .AsNoTracking()
            .AnyAsync(project => project.Id == id, cancellationToken);
    }

    public Task<bool> HasTasksAsync(int id, CancellationToken cancellationToken)
    {
        return _dbContext.TaskItems
            .AsNoTracking()
            .AnyAsync(task => task.ProjectId == id, cancellationToken);
    }

    public async Task<Project> AddAsync(
        Project project,
        CancellationToken cancellationToken)
    {
        _dbContext.Projects.Add(project);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return project;
    }

    public async Task UpdateAsync(
        Project project,
        CancellationToken cancellationToken)
    {
        _dbContext.Entry(project).State = EntityState.Modified;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        Project project,
        CancellationToken cancellationToken)
    {
        _dbContext.Projects.Remove(project);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            // Handles the race where a task is added after the service checked HasTasksAsync.
            throw new ConflictException(
                $"Project with id {project.Id} cannot be deleted because it contains tasks.",
                exception);
        }
    }
}
