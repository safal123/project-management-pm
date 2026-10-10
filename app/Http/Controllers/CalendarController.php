<?php

namespace App\Http\Controllers;

use App\Models\Workspace;

class CalendarController extends Controller
{
    public function index(Workspace $workspace)
    {
        return redirect()->route('dashboard', $workspace);
    }
}
