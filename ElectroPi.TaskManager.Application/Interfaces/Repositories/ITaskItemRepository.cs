using ElectroPi.TaskManager.Domain.Entities;
using ElectroPi.TaskManager.Domain.Enums;

namespace ElectroPi.TaskManager.Application.Interfaces.Repositories;

public interface ITaskItemRepository
{
    Task<IReadOnlyList<TaskItem>> GetAllAsync(
        TaskItemStatus? status,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<TaskItem>> GetByProjectIdAsync(
        int projectId,
        CancellationToken cancellationToken);

    Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<TaskItem> AddAsync(TaskItem taskItem, CancellationToken cancellationToken);
    Task UpdateAsync(TaskItem taskItem, CancellationToken cancellationToken);
    Task DeleteAsync(TaskItem taskItem, CancellationToken cancellationToken);
}
