import * as THREE from "three";
import { WorkTimelinePoint } from "@/types/portfolio";

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: "Before Nov 2025",
    title: "First Encounter on Valorant",
    subtitle: "Sage main on Pearl. Fate was already at work.",
    position: "right",
  },
  {
    point: new THREE.Vector3(-4, -4, -3),
    year: "Nov 29, 2025",
    title: "First Discord Message",
    subtitle: "The conversation that started everything.",
    position: "left",
  },
  {
    point: new THREE.Vector3(-3, -1, -6),
    year: "Dec 2, 2025",
    title: "Rhia's Birthday",
    subtitle: "Half Turkish, half Vietnamese, fully perfect.",
    position: "left",
  },
  {
    point: new THREE.Vector3(0, -1, -10),
    year: "Dec 3, 2025",
    title: "We Became Official",
    subtitle: "Best decision of my life. Our anniversary forever.",
    position: "left",
  },
  {
    point: new THREE.Vector3(1, 1, -12),
    year: "Forever",
    title: "Our Future",
    subtitle: "Every day with you is a new milestone.",
    position: "right",
  },
];
