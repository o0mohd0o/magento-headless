<?php
/**
 * QasrAlawani_MagezonHeadless
 *
 * Exposes Magezon Page Builder content (the decoded element tree) over GraphQL
 * so a headless front end (Next.js) can render it as components (Approach B:
 * JSON-to-React). Magezon ships no GraphQL of its own; this module is bespoke.
 */

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'QasrAlawani_MagezonHeadless',
    __DIR__
);
