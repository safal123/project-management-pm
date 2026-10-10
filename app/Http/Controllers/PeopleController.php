<?php

namespace App\Http\Controllers;

use App\Actions\Invitation\GetShareableInviteLink;
use App\Actions\People\AddWorkspaceMember;
use App\Actions\People\GetPersonProfile;
use App\Actions\People\ListPersonActivities;
use App\Actions\People\ListWorkspacePeople;
use App\Http\Requests\AddWorkspaceMemberRequest;
use App\Http\Requests\PeopleIndexRequest;
use App\Http\Requests\UpdatePersonRoleRequest;
use App\Http\Requests\WorkspacePersonRequest;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    public function index(
        Workspace $workspace,
        PeopleIndexRequest $request,
        ListWorkspacePeople $listWorkspacePeople,
        GetShareableInviteLink $shareableInviteLink
    ): Response {
        return Inertia::render('people/index', [
            ...$listWorkspacePeople->execute(
                $workspace,
                $request->user(),
                $request->validated('q'),
            ),
            'invite_link' => $shareableInviteLink->execute($request->user(), $workspace),
        ]);
    }

    public function store(
        Workspace $workspace,
        AddWorkspaceMemberRequest $request,
        AddWorkspaceMember $addWorkspaceMember
    ): RedirectResponse {
        $member = $addWorkspaceMember->execute($workspace, $request->validated('email'));

        return redirect()
            ->back()
            ->withSuccess($member->name . ' was added to the workspace.');
    }

    public function show(
        Workspace $workspace,
        User $person,
        WorkspacePersonRequest $request,
        GetPersonProfile $getPersonProfile
    ): Response {
        return Inertia::render(
            'people/show',
            $getPersonProfile->execute($request->user(), $person, $workspace),
        );
    }

    public function activities(
        Workspace $workspace,
        User $person,
        WorkspacePersonRequest $request,
        ListPersonActivities $listPersonActivities
    ): JsonResponse {
        return response()->json(
            $listPersonActivities->execute($person, $workspace, $request->integer('page', 1))
        );
    }

    public function update(
        Workspace $workspace,
        User $person,
        UpdatePersonRoleRequest $request
    ): RedirectResponse {
        $role = $request->validated('role');

        $workspace->users()->updateExistingPivot($person->id, [
            'role' => $role,
        ]);

        return redirect()
            ->back()
            ->withSuccess($person->name . ' is now a ' . $role . '.');
    }
}
