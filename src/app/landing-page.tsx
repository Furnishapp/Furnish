"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Lightbulb,
  LayoutPanelTop,
  CheckCircle2,
  BadgeCheck,
  Package2,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Client Brief",
    description:
      "Capture vision, style preferences, and project requirements from the very first conversation.",
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Idea Board",
    description:
      "Build mood boards and curate inspiration that speaks directly to your client's aesthetic.",
  },
  {
    number: "03",
    icon: LayoutPanelTop,
    title: "Slide Deck",
    description:
      "Transform your concepts into polished, client-ready presentations in minutes.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Validation",
    description:
      "Collect structured feedback and approvals at every stage — nothing falls through the cracks.",
  },
  {
    number: "05",
    icon: BadgeCheck,
    title: "Budget & Sign-off",
    description:
      "Present transparent budgets and capture digital signatures with a professional touch.",
  },
  {
    number: "06",
    icon: Package2,
    title: "Product Planning",
    description:
      "Source, organise, and track every product, fabric, and finish in one curated place.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const glass = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow:
    "0 4px 32px rgba(0,0,0,0.055), inset 0 1px 0 rgba(255,255,255,0.9)",
} as React.CSSProperties;

const glassDeep = {
  background: "rgba(255,255,255,0.42)",
  backdropFilter: "blur(48px)",
  WebkitBackdropFilter: "blur(48px)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow:
    "0 8px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)",
} as React.CSSProperties;

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "hsl(40, 22%, 96%)" }}
    >
      {/* ── Ambient colour blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-60 -left-32 w-[720px] h-[720px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsla(155,38%,74%,0.55) 0%, transparent 68%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute top-1/2 -right-48 w-[640px] h-[640px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsla(28,65%,80%,0.60) 0%, transparent 68%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-[520px] h-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsla(275,28%,80%,0.42) 0%, transparent 68%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-14 py-6">
        <span className="text-[15px] font-semibold tracking-tight text-stone-900 select-none">
          Furnish
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors px-4 py-2 rounded-full"
          >
            Sign in
          </Link>
          <Link
            href="/sign-in?mode=signup"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-700 transition-colors px-5 py-2 rounded-full"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-28 sm:pt-20 sm:pb-36">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 px-4 py-1.5 rounded-full mb-8"
          style={glass}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          End-to-end platform for interior designers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.6rem,8vw,5.5rem)] font-semibold tracking-tight text-stone-900 leading-[1.08] max-w-3xl"
        >
          From brief to{" "}
          <em className="not-italic font-light text-stone-400">beautiful.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-[1.05rem] text-stone-500 max-w-[38ch] leading-relaxed"
        >
          One elegant workspace for your entire project — from the first client
          brief to the final signed budget.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/sign-in?mode=signup"
            className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-stone-700 transition-all hover:gap-3"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
          >
            Already have an account →
          </Link>
        </motion.div>

        {/* ── Glass app preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full max-w-4xl"
        >
          <div className="rounded-3xl p-6 sm:p-10" style={glassDeep}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-7">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              <span className="ml-3 text-[11px] text-stone-400 font-medium tracking-wide">
                Riverside Loft — Client Presentation
              </span>
            </div>

            {/* Room cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { name: "Living Room", gradient: "linear-gradient(135deg,#ede6de 0%,#d7c9b8 100%)", status: "Approved" },
                { name: "Master Suite", gradient: "linear-gradient(135deg,#deeae2 0%,#c6d8cb 100%)", status: "In review" },
                { name: "Kitchen", gradient: "linear-gradient(135deg,#e8e2de 0%,#d4c8c3 100%)", status: "Pending" },
              ].map((room, i) => (
                <div
                  key={room.name}
                  className="rounded-2xl p-3 sm:p-4"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.36)",
                    border: "1px solid rgba(255,255,255,0.65)",
                  }}
                >
                  <div
                    className="w-full rounded-xl mb-3"
                    style={{ height: 72, background: room.gradient }}
                  />
                  <div className="text-[11px] font-semibold text-stone-800">{room.name}</div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{
                      color: room.status === "Approved" ? "#16a34a" : room.status === "In review" ? "#b45309" : "#9ca3af",
                    }}
                  >
                    {room.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Total Budget", value: "$48,500" },
                { label: "Client Status", value: "Signed ✓", highlight: true },
                { label: "Products", value: "24 items" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.7)",
                  }}
                >
                  <div className="text-[10px] text-stone-400 mb-1">{stat.label}</div>
                  <div
                    className="text-[13px] font-semibold"
                    style={{ color: stat.highlight ? "#16a34a" : "#1c1917" }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Workflow steps ── */}
      <section className="relative z-10 px-6 sm:px-14 pb-28 sm:pb-36">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <motion.h2
              custom={0}
              variants={fade}
              className="text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-tight text-stone-900"
            >
              Your entire project,{" "}
              <em className="not-italic font-light text-stone-400">
                one elegant flow.
              </em>
            </motion.h2>
            <motion.p
              custom={1}
              variants={fade}
              className="mt-4 text-stone-500 max-w-[40ch] mx-auto leading-relaxed"
            >
              Every stage of an interior design project — captured, organised, and
              presented with precision.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fade}
                >
                  <div className="rounded-2xl p-6 h-full" style={glass}>
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(255,255,255,0.75)",
                          border: "1px solid rgba(255,255,255,0.9)",
                        }}
                      >
                        <Icon className="w-5 h-5 text-stone-700" />
                      </div>
                      <span className="text-[11px] font-mono text-stone-300 tracking-wider">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-[13px] text-stone-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 px-6 sm:px-14 pb-36">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="rounded-3xl px-8 py-16 sm:py-20" style={glassDeep}>
            <h2 className="text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-tight text-stone-900 leading-tight">
              Ready to transform
              <br />
              <em className="not-italic font-light text-stone-400">
                your workflow?
              </em>
            </h2>
            <p className="mt-4 text-stone-500 max-w-[34ch] mx-auto leading-relaxed">
              Join designers who&apos;ve simplified how they work — from first brief
              to final sign-off.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-in?mode=signup"
                className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-stone-700 transition-all"
              >
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-stone-400 tracking-wide">
              No credit card required.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 sm:px-14 py-8" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-stone-400">Furnish</span>
          <span className="text-xs text-stone-400">Interior design, elevated.</span>
        </div>
      </footer>
    </div>
  );
}
