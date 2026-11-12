# AI-first Platform

Shared language for employees, their agents, and company projects.
Each term gives its canonical Russian form in parentheses; Russian discussions, specs, and boards use that form.

## Language

**Employee** (сотрудник):
A person working in the company who uses the platform and has access to permitted projects.

**Employee account** (учётная запись сотрудника):
An employee's identity in the platform, created when they accept an invitation, which can be active or inactive. It is linked to exactly one corporate identity, and a corporate identity has at most one employee account.
_Avoid_: аккаунт, пользователь

**Corporate identity** (корпоративная личность):
A person's identity at the company's OIDC provider, fixed by the provider and the permanent user identifier it issues. A verified email proves the invitation recipient once, at acceptance; afterwards the email is only contact data and does not identify the person.
_Avoid_: Email as identity, логин

**Invitation** (приглашение):
A single-use, expiring offer to join the platform, addressed by email to a specific recipient who has no employee account yet, with intended project memberships. It can be cancelled and grants no access until accepted.

**Invitation recipient** (получатель приглашения):
The person an invitation is addressed to, before they accept it and become an employee.

**First administrator invitation** (первое административное приглашение):
The invitation an operator issues while the platform has no active platform administrator; accepting it grants platform administrator rights. Other invitations never grant administrator rights.

**Operator** (оператор):
A person who deploys and configures the platform and the company's OIDC provider. Being an operator grants no platform permissions.
_Avoid_: Administrator for this role

**Platform administrator** (администратор платформы):
An employee authorized to manage invitations, platform access, projects, their repositories and instruction sources, and project membership. Administrators see project settings in management; reading a project's context requires project membership, as for any employee.

**Project** (проект):
A company product or business objective that groups repositories, participating employees, access permissions, and instructions for work. A project may have no repositories yet.
_Avoid_: Repository as a synonym for project.

**Project membership** (участие в проекте):
An employee's participation in a project that grants access to its permitted information, including information about all its repositories.
_Avoid_: членство, доступ к проекту

**Project context** (контекст проекта):
The information a project member and their connected agent receive about a project: its description, repositories, instruction sources, and selected harness version.

**Platform permission** (разрешение платформы):
An authorization to perform an action or receive information in the platform. It is distinct from permission to access a repository in GitHub.

**Repository** (репозиторий):
A Git repository registered once in the platform and associated with any number of projects. Access to its information through one project does not reveal other projects associated with it.
_Avoid_: Project as a synonym for repository.

**Shared harness** (общий harness):
The company's single set of shared agent instructions and skills, kept in several versions in its own Git repository.

**Harness version** (версия harness):
A fixed revision of the shared harness selected for a project. Selecting a version does not prove that its files are applied in the project's repositories.

**Connected agent** (подключённый агент):
A ready-made development agent that an employee launches and connects to the platform. The agent receives company information within that employee's permissions.
_Avoid_: Company agent when referring to an employee's connected agent.

**Agent connection** (подключение агента):
An independently revocable connection of a ready-made agent client to the platform, belonging to one employee. An employee may have multiple connections; a connection is distinct from an agent run or conversation.

**Project instructions** (инструкции проекта):
Guidance for an employee and their agent on the common way of working with a project, including preparing its environment. Its content may reside in Git.

**Repository instructions** (инструкции репозитория):
Guidance local to an individual repository, distinct from the project's common instructions and shared by every project the repository belongs to. Its content may reside in Git.

**Instruction source** (источник инструкций):
A location of instruction content linked to a project or repository in the platform. The platform administrator manages the link; repository authors maintain content held in Git.

**Task tracker** (трекер задач):
An existing external system that owns tasks, their discussions, and their status.
