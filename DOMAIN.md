# AI-first Platform

Shared language for employees, their agents, and company projects.

## Language

**Employee**:
A person working in the company who uses the platform and has access to permitted projects.

**Employee account**:
An employee's identity in the platform, created when they accept an invitation, which can be active or inactive.

**Invitation**:
A single-use, expiring offer addressed to a specific recipient to join the platform, with intended project memberships. It can be cancelled and grants no access until accepted.

**Platform administrator**:
An employee authorized to manage invitations, platform access, projects, their repositories and instruction sources, and project membership. Reading project working information requires project membership, including for administrators.

**Project**:
A company product or business objective that groups one or more repositories, participating employees, access permissions, and instructions for work.
_Avoid_: Repository as a synonym for project.

**Project membership**:
An employee's participation in a project that grants access to its permitted information, including information about all its repositories.

**Platform permission**:
An authorization to perform an action or receive information in the platform. It is distinct from permission to access a repository in GitHub.

**Repository**:
A Git repository associated with one or more projects. Access to its information through one project does not reveal other projects associated with it.
_Avoid_: Project as a synonym for repository.

**Connected agent**:
A ready-made development agent that an employee launches and connects to the platform. The agent receives company information within that employee's permissions.
_Avoid_: Company agent when referring to an employee's connected agent.

**Agent connection**:
An independently revocable connection of a ready-made agent client to the platform, belonging to one employee. An employee may have multiple connections; a connection is distinct from an agent run or conversation.

**Project instructions**:
Guidance for an employee and their agent on the common way of working with a project, including preparing its environment. Its content may reside in Git.

**Repository instructions**:
Guidance local to an individual repository, distinct from the project's common instructions. Its content may reside in Git.

**Instruction source**:
A location of instruction content linked to a project or repository in the platform. The platform administrator manages the link; repository authors maintain content held in Git.

**Task tracker**:
An existing external system that owns tasks, their discussions, and their status.
