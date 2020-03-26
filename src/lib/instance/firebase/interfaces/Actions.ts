export type ActionType =
  | "added"
  | "added some"
  | "removed"
  | "removed some"
  | "edited"
  | "edited some"
  | "completed"
  | "archived";

export interface ActionFunctionArguments<CollectionPath, DocumentPath> {
  user_id?: string;
  user_email?: string;

  resource_type: 'Document' | 'Collection';
  resource_path_template: CollectionPath | DocumentPath;
  resource_path_resolved: string;

  action: ActionType;
  resource_ids?: string[];
}

export type ActionFunction<CollectionPath, DocumentPath> = (
  data: ActionFunctionArguments<CollectionPath, DocumentPath>
) => Promise<any> | void;
