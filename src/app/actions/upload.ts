"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function getPresignedUrl(
    fileName: string,
    contentType: string,
    folder: "talent" | "campaigns" | "team" = "talent"
) {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return { signedUrl, key };
}
