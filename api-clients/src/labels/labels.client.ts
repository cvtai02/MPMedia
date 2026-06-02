import { BaseApiClient } from '../shared/base.client';
import { Label, CreateLabelRequest, UpdateLabelRequest } from './labels.types';

export class LabelsClient extends BaseApiClient {
  list(): Promise<Label[]> { return this.get<Label[]>('/labels'); }
  create(body: CreateLabelRequest): Promise<Label> { return this.post<Label>('/labels', body); }
  update(id: string, body: UpdateLabelRequest): Promise<Label> { return this.patch<Label>(`/labels/${id}`, body); }
  remove(id: string): Promise<void> { return this.delete<void>(`/labels/${id}`); }
  assignToMedia(mediaId: string, labelId: string): Promise<void> { return this.post<void>(`/media/${mediaId}/labels/${labelId}`); }
  removeFromMedia(mediaId: string, labelId: string): Promise<void> { return this.delete<void>(`/media/${mediaId}/labels/${labelId}`); }
}
