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

  resource_collection_template: CollectionPath;
  resource_document_template: DocumentPath;

  resource_path_collection_resolved: string;
  action: ActionType;
  resource_ids?: string[];
}

export type ActionFunction<CollectionPath, DocumentPath> = (
  data: ActionFunctionArguments<CollectionPath, DocumentPath>
) => Promise<any> | void;
