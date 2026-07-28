<?php

namespace App\Services;

use App\Repositories\Contracts\TagRepositoryInterface;

class TagService
{
    protected $tagRepository;

    public function __construct(TagRepositoryInterface $tagRepository)
    {
        $this->tagRepository = $tagRepository;
    }

    public function getAllTags(array $filters = [])
    {
        return $this->tagRepository->all($filters);
    }

    public function getPaginatedTags($perPage = 15, array $filters = [])
    {
        return $this->tagRepository->paginate($perPage, $filters);
    }

    public function getTagById($id)
    {
        return $this->tagRepository->find($id);
    }

    public function createTag(array $data)
    {
        return $this->tagRepository->create($data);
    }

    public function updateTag($id, array $data)
    {
        return $this->tagRepository->update($id, $data);
    }

    public function deleteTag($id)
    {
        return $this->tagRepository->delete($id);
    }

    public function bulkDeleteTags(array $ids)
    {
        return $this->tagRepository->bulkDelete($ids);
    }

    public function bulkUpdateStatus(array $ids, $status)
    {
        return $this->tagRepository->bulkUpdateStatus($ids, $status);
    }
}
