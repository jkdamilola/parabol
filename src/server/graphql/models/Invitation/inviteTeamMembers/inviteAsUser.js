import getRethink from 'server/database/rethinkDriver';
import asyncInviteTeam from 'server/safeMutations/asyncInviteTeam';
import createPendingApprovals from 'server/safeMutations/createPendingApprovals';

export default async function inviteAsUser(invitees, orgId, userId, teamId, teamName) {
  const r = getRethink();
  const inviteeEmails = invitees.map((i) => i.email);
  // send invitation that don't need approval
  const inOrgInvitees = await r.table('User')
    .getAll(orgId, {index: 'userOrgs'})
    .filter((user) => r.expr(inviteeEmails).contains(user('email')))
    .merge((user) => ({
      fullName: user('preferredName')
    }))
    .pluck('fullName', 'email');
  if (inOrgInvitees.length > 0) {
    await asyncInviteTeam(userId, teamId, inOrgInvitees);
  }

  // seek approval for the rest
  const outOfOrgEmails = inviteeEmails.filter((email) => !inOrgInvitees.find((i) => i.email === email));
  const inviter = {
    orgId,
    teamId,
    teamName,
    userId
  };
  if (outOfOrgEmails.length) {
    await createPendingApprovals(outOfOrgEmails, inviter);
    return false;
  }
  return true;
}
