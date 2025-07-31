import { db } from "@/lib/db";

const updateOrganization = async (payload: any, id: string) => {
  try {
    const data = await db.organization.update({
      where: { id },
      data: payload,
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getClientById = async (
  id: string,
  email?: string | null,
  organization_id?: string | null,
) => {
  try {
    let user = await db.user.findUnique({
      where: { id },
    });

    if (!user && email) {
      user = await db.user.create({
        data: {
          id,
          user_id: id,
          email,
          organization_id,
        },
      });
    }

    if (user && user.organization_id !== organization_id) {
      user = await db.user.update({
        where: { id },
        data: { organization_id },
      });
    }

    if (!user) return null;

    return {
      ...user,
      created_at: user.createdAt,
      user_id: user.user_id || user.id,
      image_url: user.image_url || "",
      organization_id: user.organization_id || "",
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getOrganizationById = async (
  organization_id?: string,
  organization_name?: string,
) => {
  try {
    if (!organization_id) return null;

    let organization = await db.organization.findUnique({
      where: { id: organization_id },
    });

    if (!organization) {
      organization = await db.organization.create({
        data: {
          id: organization_id,
          name: organization_name,
        },
      });
    }

    if (organization_name && organization.name !== organization_name) {
      organization = await db.organization.update({
        where: { id: organization_id },
        data: { name: organization_name },
      });
    }

    return organization;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const ClientService = {
  updateOrganization,
  getClientById,
  getOrganizationById,
};
