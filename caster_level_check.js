// Caster Level Check v1.0
// FoundryVTT v9.242
// D35E v0.99.1
// Some upfront sanity checking to make sure a single token is selected by the user
if (canvas.tokens.controlled.length < 1) {
  new Dialog({
    title: "Caster Level Check ERROR",
    content: "A character token must be selected.",
    buttons: {
      button1: {
        label: "OK"
      }
    },
    default: "button1"
  }).render(true);
  return;
}
if (canvas.tokens.controlled.length > 1) {
  new Dialog({
    title: "Caster Level Check ERROR",
    content: "Only one character token can be selected.",
    buttons: {
      button1: {
        label: "OK"
      }
    },
    default: "button1"
  }).render(true);
  return;
}

let selectedActorData = canvas.tokens.controlled[0].actor.data
console.log(selectedActorData)

// At this point we have verified that only one token is selected, and we have retrieved its actor data!

// The following is just a utility function to convert a string into Title Case format
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// The following callback function will actually roll the Caster Level Check in the Chat panel
function callbackCasterLevelCheckSecondDialog(actor, sbName, clName, cl, takeTen, html=null) {
  //ui.notifications.info("Button "+sbName+": "+clName+" Clicked! check bonus = "+cl+" + "+sp);
  let die_t = "1d20"
  if (takeTen) {
    die_t = "10"
  }
  let clc_mod_t  = ""
  if (html && (html.find('[name="spell-penetration"]').length > 0) && (html.find('[name="spell-penetration"]')[0].checked)) {
    clc_mod_t += " + "+html.find('[name="spell-penetration"]')[0].value
  }
  if (html && (html.find('[name="cooperative-spell"]').length > 0) && (html.find('[name="cooperative-spell"]')[0].checked)) {
    clc_mod_t += " + "+html.find('[name="cooperative-spell"]')[0].value
  }
  if (html && (html.find('[name="heroic-destiny"]').length > 0) && (html.find('[name="heroic-destiny"]')[0].checked)) {
    clc_mod_t += " + "+html.find('[name="heroic-destiny"]')[0].value
  }
  if (html && (html.find('[name="elven-spell-lore"]').length > 0) && (html.find('[name="elven-spell-lore"]')[0].checked)) {
    clc_mod_t += " + "+html.find('[name="elven-spell-lore"]')[0].value
  }
  if (html && (html.find('[name="portal-sensitive"]').length > 0) && (html.find('[name="portal-sensitive"]')[0].checked)) {
    clc_mod_t += " + "+html.find('[name="portal-sensitive"]')[0].value
  }
  let sit_t = ""
  if (html & html.find() && (html.find('[name="situational-bonus"]')[0].value != "")) {
    sit_t += " + "+html.find('[name="situational-bonus"]')[0].value
  }
  let roll = new Roll("@d + @cl@mod@sit",{d:die_t, cl: cl, mod: clc_mod_t, sit: sit_t}).evaluate({async:false});
  roll.toMessage({
    user: game.user._id,
    speaker: ChatMessage.getSpeaker({token: actor}),
    flavor: `Caster Level Check`
  })
}

// The following callback function will process the actor to find any pertinant info for the CL check
function callbackCasterLevelCheckFirstDialog(actor, spellbook) {
  let spellbookName = actor.data.attributes.spells.spellbooks[spellbook].name
  let dndClass      = toTitleCase(actor.data.attributes.spells.spellbooks[spellbook].class)
  let casterLevel   = actor.data.attributes.spells.spellbooks[spellbook].cl.total

  // Find items that have featSpellPenetrationBonus set.
  let arcaneMastery    = false
  let spellPenetration = 0
  let cooperativeSpell = false
  let heroicDestiny    = false
  let elvenSpellLore   = false
  let portalSensitive  = false
  actor.items.contents.forEach((item, idx) => {
    if (item.name == "Arcane Mastery") {
      arcaneMastery = true
    }
    if (item.name == "Cooperative Spell") {
      cooperativeSpell = true
    }
    if (item.name == "Heroic Destiny") {
      heroicDestiny = true
    }
    if (item.name == "Elven Spell Lore") {
      elvenSpellLore = true
    }
    if (item.name == "Portal Sensitive") {
      portalSensitive = true
    }
    if (item.data.data.combatChanges) {
      item.data.data.combatChanges.forEach((change) => {
        if ((change[3] == "featSpellPenetrationBonus") && (!isNaN(change[4])) && (parseInt(change[4]) > spellPenetration)) {
          spellPenetration = parseInt(change[4])
        }
      });
    }
  });
  console.log("Arcane Mastery   = " + arcaneMastery)
  console.log("spellPenetration = " + spellPenetration)
  console.log("cooperativeSpell = " + cooperativeSpell)
  console.log("heroicDestiny    = " + heroicDestiny)
  console.log("elvenSpellLore   = " + elvenSpellLore)
  console.log("portalSensitive  = " + portalSensitive)

  let myContent = `<form>
  <div class="form-group">
    <label for="situational-bonus">Situational Bonus</label><input type="text" id="situational-bonus" name="situational-bonus" placeholder="e.g. +1d4"></input>
  </div>
  <div class="form-group">
    <label class="block-header">
      Caster Level Check Modifiers
    </label>
  </div>`;
  if (spellPenetration > 0) {
    myContent += `
<div class="form-group">
  <label for="spell-penetration">Spell Penetration</label><input type="checkbox" id="spell-penetration" name="spell-penetration" value="${spellPenetration}"></input>
</div>`;
  }
  if (cooperativeSpell) {
    myContent += `
<div class="form-group">
  <label for="cooperative-spell">Spell Penetration</label><input type="checkbox" id="cooperative-spell" name="cooperative-spell" value="1"></input>
</div>`;
  }
  if (heroicDestiny) {
    myContent += `
<div class="form-group">
  <label for="heroic-destiny">Spell Penetration</label><input type="checkbox" id="heroic-destiny" name="heroic-destiny" value="1d6"></input>
</div>`;
  }
  if (elvenSpellLore) {
    myContent += `
<div class="form-group">
  <label for="elven-spell-lore">Spell Penetration</label><input type="checkbox" id="elven-spell-lore" name="elven-spell-lore" value="2"></input>
</div>`;
  }
  if (portalSensitive) {
    myContent += `
<div class="form-group">
  <label for="portal-sensitive">Spell Penetration</label><input type="checkbox" id="portal-sensitive" name="portal-sensitive" value="2"></input>
</div>`;
  }
  myContent += `
</form>`;
  let myButtons = {}
  if (arcaneMastery) {
    myButtons["take10"] = {
      label: "Take 10",
      callback: (html) => callbackCasterLevelCheckSecondDialog(actor, spellbookName, dndClass, casterLevel, true, html)
    }
  }
  myButtons["roll"] = {
    label: "Roll",
    callback: (html) => callbackCasterLevelCheckSecondDialog(actor, spellbookName, dndClass, casterLevel, false, html)
  }
  new Dialog({
    title: "Caster Level Check",
    content: myContent,
    buttons: myButtons,
    default: "roll"
  }).render(true);
}

// Now build the FIRST dialog window that is displayed
let buttonNum = 1
let spellbookButtons = {}
let passthru_spellbook = null

if (selectedActorData.data.attributes.spells.spellbooks.primary.cl.total > 0) {
  spellbookButtons["button"+buttonNum] = {
    label: selectedActorData.data.attributes.spells.spellbooks.primary.name+": "+toTitleCase(selectedActorData.data.attributes.spells.spellbooks.primary.class),
    callback: (actor, spellbook) => callbackCasterLevelCheckFirstDialog(selectedActorData, "primary") }
  passthru_spellbook = "primary"
  buttonNum++
}

if (selectedActorData.data.attributes.spells.spellbooks.secondary.cl.total > 0) {
  spellbookButtons["button"+buttonNum] = {
    label: selectedActorData.data.attributes.spells.spellbooks.secondary.name+": "+toTitleCase(selectedActorData.data.attributes.spells.spellbooks.secondary.class),
    callback: (actor, spellbook) => callbackCasterLevelCheckFirstDialog(selectedActorData, "secondary") }
  passthru_spellbook = "secondary"
  buttonNum++
}

if (selectedActorData.data.attributes.spells.spellbooks.tertiary.cl.total > 0) {
  spellbookButtons["button"+buttonNum] = {
    label: selectedActorData.data.attributes.spells.spellbooks.tertiary.name+": "+toTitleCase(selectedActorData.data.attributes.spells.spellbooks.tertiary.class),
    callback: (actor, spellbook) => callbackCasterLevelCheckFirstDialog(selectedActorData, "tertiary") }
  passthru_spellbook = "tertiary"
  buttonNum++
}

if (selectedActorData.data.attributes.spells.spellbooks.spelllike.cl.total > 0) {
  spellbookButtons["button"+buttonNum] = {
    label: selectedActorData.data.attributes.spells.spellbooks.spelllike.name+": "+toTitleCase(selectedActorData.data.attributes.spells.spellbooks.spelllike.class),
    callback: (actor, spellbook) => callbackCasterLevelCheckFirstDialog(selectedActorData, "spelllike") }
  passthru_spellbook = "spelllike"
  buttonNum++
}

// Error Catching:

if (Object.keys(spellbookButtons).length < 1) {
  new Dialog({
    title: "Caster Level Check ERROR",
    content: "No caster levels found",
    buttons: {
      button1: {
        label: "OK"
      }
    },
    default: "button1"
  }).render(true);
  return;
}

if (Object.keys(spellbookButtons).length == 1) {
  callbackCasterLevelCheckFirstDialog(selectedActorData, passthru_spellbook);
  return;
}


// Now create the dialog box that will chose which class to roll the Caster Level Check against
new Dialog({
  title: "Caster Level Check",
  content: "Select Spellcasting Class or Spell-like",
  buttons: spellbookButtons,
  default: "button1"
}).render(true);
