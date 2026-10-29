# Creating games

Games live in a project, inside an organization. Any member of an organization can create, edit and delete games in its projects.

## The dashboard

After sign-in you land on the **Workspace console** (`/workspace/dashboard`).

- **Organization** and **Project** pickers: choose where you work. Both are searchable. Your choice is remembered in the browser. The gear icon next to each picker opens **Manage organizations** or **Manage projects**.
- **Key metrics**: number of games, projects and members.
- **Your active party**: shown when you are hosting or playing a party. Click **Open lobby** or **Open live party** to get back to it.
- **Your games**: the games of the selected project. Filter with **Search games...**, **Game type** and **Sort by** (Date or Name). Each card shows how many stages are ready and has two buttons, **Manage** and **Create party**.

## Create a game

1. On the dashboard, click **Create game**. The "Create a new game" dialog opens.
2. Choose a **Game type**:
   - **Quiz**: timed question rounds with one or more correct answers.
   - **Prediction**: prompts with outcomes. Players pick the outcome they expect, and the host marks the resolved one.
3. Enter a **Title** (up to 160 characters) and an optional **Description** (up to 500 characters).
4. Click **Create game**. You land in the editor.

## The editor

The editor (`/quizzes/:id` or `/predictions/:id`) has three tabs. Changes save automatically. The status bar shows "Saving..." then "Saved just now".

### Setup

Edit the **Title** and **Description**, then click **Save details**.

### Questions (or Prompts)

Click **Create question** (or **Create prompt** for predictions). An editing panel opens on the right. Fill in:

- **Question**: the text, up to 500 characters.
- **Question type** (quiz only): **Multiple choice** or **True or false**.
- **Answers**: use **Add answer** to add options. You need between 2 and 4 answers, each up to 240 characters. Toggle **Correct answer** on at least one. Several answers can be correct. True or false questions have fixed True and False answers with exactly one correct.
- **Advanced settings**: **Time limit** in seconds (at least 5, default 20) and **Points** (default 1000).

Click **Save question**. Each question then appears as a card on the left, with its points, time limit and number of answers, and the buttons **Up**, **Down** and **Remove**. Click a card to reopen it in the panel. Cards can also be reordered by dragging.

For predictions, the fields are called **Prompt**, **Outcomes** and **Resolved outcome**. There is no type selector.

### Review

- **Readiness checklist**: details filled in, at least one question ready, every question ready.
- **Estimated run time**: total of the time limits.
- Each question is marked **Ready** or **Incomplete**. **Go to first issue** jumps to the first incomplete one.

A game can be launched as a party only when it has at least one ready stage.

### Delete a game

Open the **More** menu and click **Delete quiz** (or **Delete prediction game**). This cannot be undone. A game cannot be deleted while a party is running on it.

## Import a game from a file

1. On the dashboard, click **Import game**.
2. Pick the **Game type**, enter a **Title** and **Description**.
3. Download a template to see the expected format: **CSV template**, **JSON template**, **Markdown template** or **Plain text template**.
4. Drop your file in the upload zone. Accepted extensions: `.csv`, `.json`, `.md`, `.markdown`, `.txt`. Maximum size: 5 MB.
5. Click **Create and import**.

In Markdown and plain text files, answers are written as a checklist. `- [x]` marks a correct answer and `- [ ]` a wrong one. Optional `Time:`, `Points:` and `Type: truefalse` lines set the time limit, the points and the question type. When a value is missing, the import uses 20 seconds and 1000 points.

## Organizations and projects

Click the gear icon next to the organization picker on the dashboard (`/workspace/organizations`).

### Roles

| Action | Member | Manager | Owner |
| --- | --- | --- | --- |
| Create, edit and delete games | yes | yes | yes |
| Host parties | yes | yes | yes |
| Edit the organization | no | yes | yes |
| Create, edit and remove projects | no | yes | yes |
| Add and remove members, change roles | no | yes | yes |
| Assign the Owner role, manage another Owner | no | no | yes |

An organization always keeps at least one owner. The last owner cannot be removed or demoted.

### Create an organization

Click **Create organization**, enter a **Name** (unique across Pleey), an optional **Description** and the **Default party mode** (see [Hosting a party](./hosting-a-party.md#party-settings)). You become its owner, and a project named "Default" is created inside it.

### Members

In **Member management**:

- Add someone with **Username or email**, pick a **Role** (Owner, Manager or Member), then click **Add member**. The person must already have a Pleey account.
- Change a role with the **Role** picker next to the member.
- **Remove** asks for confirmation.

### Projects

In **Project management**:

- **Create project** with a **Name**, a **Description** and a **Default party mode**.
- **Edit** a project.
- **Remove** a project. If it contains games, pick where they go in **Migrate games to** before confirming. An organization always keeps at least one project.
