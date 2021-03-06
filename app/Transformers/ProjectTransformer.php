<?php

namespace CodeProject\Transformers;

use CodeProject\Entities\Project;
use League\Fractal\TransformerAbstract;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;

class ProjectTransformer extends TransformerAbstract
{

//    protected $defaultIncludes = ['members'];
//    protected $defaultIncludes = ['members', 'client', 'notes', 'tasks', 'files'];

    public function transform(Project $project)
    {
        return [
            'id' => $project->id,
            'owner_id' => $project->owner_id,
            'client_id' => $project->client_id,
            'name' => $project->name,
            'description' => $project->description,
            'progress' => $project->progress,
            'status' => $project->status,
            'due_date' => $project->due_date,
            'is_member' => $project->owner_id != Authorizer::getResourceOwnerId()
        ];
    }

    public function includeClient(Project $project)
    {
        return $this->item($project->client, new ClientTransformer());
    }

    public function includeMembers(Project $project)
    {
        return $this->collection($project->members, new ProjectMemberTransformer());
    }

    public function includeNotes(Project $project)
    {
        return $this->collection($project->notes, new ProjectNoteTransformer());
    }

    public function includeTasks(Project $project)
    {
        return $this->collection($project->tasks, new ProjectTaskTransformer());
    }

    public function includeFiles(Project $project)
    {
        return $this->collection($project->files, new ProjectFileTransformer());
    }
}