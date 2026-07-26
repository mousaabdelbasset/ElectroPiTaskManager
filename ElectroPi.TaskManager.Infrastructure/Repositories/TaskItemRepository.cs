using ElectroPi.TaskManager.Application.Interfaces.Repositories;
using ElectroPi.TaskManager.Domain.Entities;
using ElectroPi.TaskManager.Domain.Enums;
using ElectroPi.TaskManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectroPi.TaskManager.Infrastructure.Repositories;

public sealed class TaskItemRepository : ITaskItemRepository
{
    private readonly TaskManagerDbContext _dbContext;

    public TaskItemRepository(TaskManagerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(
        TaskItemStatus? status,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.TaskItems.AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(task => task.Status == status.Value);
        }

        return await query
            .OrderBy(task => task.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaskItem>> GetByProjectIdAsync(
        int projectId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.TaskItems
            .AsNoTracking()
            .Where(task => task.ProjectId == projectId)
            .OrderBy(task => task.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return _dbContext.TaskItems
            .AsNoTracking()
            .SingleOrDefaultAsync(task => task.Id == id, cancellationToken);
    }

    public async Task<TaskItem> AddAsync(
        TaskItem taskItem,
        CancellationToken cancellationToken)
    {
        _dbContext.TaskItems.Add(taskItem);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return taskItem;
    }

    public async Task UpdateAsync(
        TaskItem taskItem,
        CancellationToken cancellationToken)
    {
        _dbContext.Entry(taskItem).State = EntityState.Modified;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        TaskItem taskItem,
        CancellationToken cancellationToken)
    {
        _dbContext.TaskItems.Remove(taskItem);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
