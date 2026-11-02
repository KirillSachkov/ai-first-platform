/** Nest token for {@link ProjectsContract}. */
export const PROJECTS = Symbol("ProjectsContract");

export interface ProjectsContract {
  /** True when every given project exists. */
  projectsExist: (projectIds: readonly string[]) => Promise<boolean>;
}
