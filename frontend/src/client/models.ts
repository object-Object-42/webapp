export type Body_login_login_access_token = {
  grant_type?: string | null;
  username: string;
  password: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
};

export type HTTPValidationError = {
  detail?: Array<ValidationError>;
};

export type OrganisationCreate = {
  org_name: string;
};

export type GetUserOrganisation = {
  userId: string;
};

export type OrganisationPublic = {
  org_name: string;
  org_id: string;
};

export type OrganisationUpdate = {
  org_name: string;
};

export type OrganisationsPublic = {
  data: Array<OrganisationPublic>;
  count: number;
};

export type Message = {
  message: string;
};

export type NewPassword = {
  token: string;
  new_password: string;
};

export type Token = {
  access_token: string;
  token_type?: string;
};

export type UpdatePassword = {
  current_password: string;
  new_password: string;
};

export type UserCreate = {
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  password: string;
};

export type UserPublic = {
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  id: string;
};

export type UserOrganisationPublic = {
  user_id: string;
  org_id: string;
};

export type UserOrganisationsPublic = {
  data: Array<UserOrganisationPublic>;
};

export type UserRegister = {
  email: string;
  password: string;
  full_name?: string | null;
};

export type UserUpdate = {
  email?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  password?: string | null;
  active_org_ids: Array<string>;
};

export type UserUpdateMe = {
  full_name?: string | null;
  email?: string | null;
};

export type UsersPublic = {
  data: Array<UserPublic>;
  count: number;
};

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type dataPoints = {
  x: number
  y: number
  doc_name: string
  org_id: number
  }

export type ClusterType = {
  points: dataPoints[]
  color: string;
  }

export type Organizations = {
  [key: string]: ClusterType;
}

export type VectorReturn = {
  titles: string[];
  organizations: Organizations;
}
