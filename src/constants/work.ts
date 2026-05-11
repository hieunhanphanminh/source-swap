import * as THREE from "three";
import { WorkTimelinePoint } from "@/types/portfolio";

// Full milestone history mirrored from project source TimelinePage.
// Points are placed along a winding 3D path so the camera glides through them.
export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: "Before Nov 2025",
    title: "First Encounter on Valorant",
    subtitle: "Sage main on Pearl. Fate was already at work.",
    detail:
      "I didn't know yet that the random Sage on my team would become the most important person in my life.",
    badge: "⚔️",
    badgeLabel: "Quest Start",
    stats: ["+50 Destiny", "+30 Curiosity"],
    boss: false,
    position: "right",
  },
  {
    point: new THREE.Vector3(-3, -1.5, -3),
    year: "Nov 29, 2025",
    title: "First Discord Message",
    subtitle: "The conversation that started everything.",
    detail:
      "From that first message, I felt something different. You weren't just another person online — you were someone special.",
    badge: "💫",
    badgeLabel: "Connection Made",
    stats: ["+80 Courage", "+60 Hope"],
    boss: false,
    position: "left",
  },
  {
    point: new THREE.Vector3(-2, 0.5, -6),
    year: "Dec 2, 2025",
    title: "Rhia's Birthday",
    subtitle: "Half Turkish, half Vietnamese, fully perfect.",
    detail:
      "Born on December 2nd, just one day before we became official. The universe really planned this perfectly.",
    badge: "🌟",
    badgeLabel: "Special Day",
    stats: ["+100 Joy", "+50 Gratitude"],
    boss: false,
    position: "right",
  },
  {
    point: new THREE.Vector3(0, -1, -9),
    year: "Dec 3, 2025",
    title: "We Became Official",
    subtitle: "Best decision of my life. Our anniversary forever.",
    detail:
      "One day after your birthday — like the universe gave us both the best gift we could ever ask for.",
    badge: "👑",
    badgeLabel: "BOSS LEVEL",
    stats: ["+200 Love", "+100 Happiness", "+∞ Commitment"],
    boss: true,
    position: "left",
  },
  {
    point: new THREE.Vector3(2.5, 0, -12),
    year: "Ongoing",
    title: "Through Every Restriction",
    subtitle: "Distance and rules can't stop what we have.",
    detail:
      "Even when your parents restricted you from texting and playing, you still remembered me. You still came back. That's when I truly knew you were special.",
    badge: "🛡️",
    badgeLabel: "Trial Overcome",
    stats: ["+150 Trust", "+120 Resilience"],
    boss: false,
    position: "right",
  },
  {
    point: new THREE.Vector3(0.5, 1.5, -15),
    year: "Ongoing",
    title: "Gaming Together",
    subtitle: "Valorant, Fortnite, DBD, Roblox — better with you.",
    detail:
      "Win or lose, every match with you is my favorite. You make even the worst games fun.",
    badge: "🏆",
    badgeLabel: "Side Quest",
    stats: ["+80 Fun", "+60 Teamwork"],
    boss: false,
    position: "left",
  },
  {
    point: new THREE.Vector3(-1, 0, -18),
    year: "Forever",
    title: "Our Future",
    subtitle: "Every day with you is a new milestone.",
    detail:
      "The best chapters of our story haven't been written yet — and I can't wait to live them with you.",
    badge: "✨",
    badgeLabel: "Legendary",
    stats: ["+∞ Love", "+∞ Forever"],
    boss: true,
    position: "right",
  },
];
