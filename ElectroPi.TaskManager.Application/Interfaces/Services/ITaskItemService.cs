using ElectroPi.TaskManager.Application.DTOs.Tasks;
using ElectroPi.TaskManager.Domain.Enums;

namespace ElectroPi.TaskManager.Application.Interfaces.Services;

public interface ITaskItemService
{
    Task<IReadOnlyList<TaskItemResponse>> GetAllAsync(
        TaskItemStatus? status,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<TaskItemResponse>> GetByProjectIdAsync(
        int projectId,
        CancellationToken cancellationToken);

    Task<TaskItemResponse> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<TaskItemResponse> CreateAsync(
        CreateTaskItemRequest request,
        CancellationToken cancellationToken);

    Task UpdateAsync(
        int id,
        UpdateTaskItemRequest request,
        CancellationToken cancellationToken);

    Task UpdateStatusAsync(
        int id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken);

    Task DeleteAsync(int id, CancellationToken cancellationToken);
}
