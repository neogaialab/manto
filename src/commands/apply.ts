import { existsSync } from "node:fs"
import path from "node:path"
import { SlashCommandBuilder } from "discord.js"
import type { ExecuteFn } from "../../lib/discord/slash-commands/types"
import { templatesPath } from "../engine/config/ambient"
import { loadConfig } from "../engine/config/load"
import { readConfig } from "../engine/config/reader"
import { saveManto } from "../engine/config/save"

export const data = new SlashCommandBuilder()
  .setName("apply")
  .setDescription("Update the server settings based on a template.")
  .addStringOption(o => o
    .setName("template-name")
    .setDescription("Template name to be used.")
    .setRequired(true),
  )

export const execute: ExecuteFn = async (inter) => {
  const templateName = inter.options.getString("template-name") as string

  const rootDir = path.join(templatesPath, templateName)

  if (!existsSync(rootDir)) {
    await inter.reply({ content: `Template not found: ${templateName}`, ephemeral: true })
    return
  }

  if (!inter.guild) {
    await inter.reply({ content: `This command should be executed inside a guild.`, ephemeral: true })
    return
  }

  await inter.reply({ content: `Updating server settings based on \`${templateName}\`.`, ephemeral: true })

  const config = readConfig(rootDir)

  await saveManto(inter.guild, config, { rootDir })
  await loadConfig(inter.guild, config)

  await inter.editReply({ content: `Server settings have been updated.` })
}
