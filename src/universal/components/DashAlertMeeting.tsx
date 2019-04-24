import {DashAlertMeeting_viewer} from '__generated__/DashAlertMeeting_viewer.graphql'
import React, {useMemo} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import DashAlertBar from 'universal/components/DashAlertBar'
import DashAlertLink from 'universal/components/DashAlertLink'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import plural from 'universal/utils/plural'
import {MeetingTypes} from '../types/constEnums'

const getActiveMeetings = (viewer) => {
  const activeMeetings: {link: string; name: string}[] = []
  const teams = (viewer && viewer.teams) || []
  teams.forEach((team) => {
    const {meetingId, newMeeting} = team
    if (meetingId) {
      const meetingType = newMeeting ? newMeeting.meetingType : MeetingTypes.ACTION
      const meetingSlug = meetingTypeToSlug[meetingType]
      activeMeetings.push({
        link: `/${meetingSlug}/${team.id}`,
        name: team.name
      })
    }
  })
  return activeMeetings
}

const MessageBlock = styled('div')({
  fontWeight: 600
})

interface Props {
  viewer: DashAlertMeeting_viewer | null
}

const DashAlertMeeting = (props: Props) => {
  const {viewer} = props
  const activeMeetings = useMemo(() => getActiveMeetings(viewer), [viewer])
  if (activeMeetings.length === 0) return null
  return (
    <DashAlertBar>
      <MessageBlock>{`${plural(activeMeetings.length, 'Meeting')} in progress:  `}</MessageBlock>
      {activeMeetings.map((meeting) => {
        return (
          <DashAlertLink key={meeting.link} title='Join Active Meeting' to={meeting.link}>
            {meeting.name}
          </DashAlertLink>
        )
      })}
    </DashAlertBar>
  )
}

export default createFragmentContainer(
  DashAlertMeeting,
  graphql`
    fragment DashAlertMeeting_viewer on User {
      teams {
        id
        meetingId
        newMeeting {
          id
          meetingType
        }
        name
      }
    }
  `
)